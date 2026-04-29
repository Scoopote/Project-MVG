const fs = require("fs");
const Book = require("../models/book");

// Créer un livre
exports.createBook = async (req, res, next) => {
  let bookObject;
  try {
    bookObject = JSON.parse(req.body.book);
  } catch (error) {
    return res.status(400).json({ message: "JSON invalide dans le corps de la requête." });
  }
  delete bookObject._id;

  const initialGrade = Number(bookObject.ratings?.[0]?.grade);
  const validGrade = !isNaN(initialGrade) ? initialGrade : 0;

  let imageUrl = req.file
    ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    : "";

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl,
    ratings: [{ userId: req.auth.userId, grade: validGrade }],
    averageRating: validGrade,
  });

  try {
    
    if (req.file) {
      const inputPath = req.file.path; 
      const outputPath = `images/optimized_${req.file.filename}`;

      fs.unlinkSync(inputPath);

      
      book.imageUrl = `${req.protocol}://${req.get("host")}/images/optimized_${req.file.filename}`;
    }

    await book.save();
    res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erreur lors de l'enregistrement du livre." });
  }
};

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ message: "Erreur lors de la récupération des livres." }));
};

// Récupérer un seul livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ message: "Livre non trouvé." }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  delete bookObject._id;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      if (req.file) {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) {
            return res.status(500).json({ message: "Erreur lors de la suppression de l'image." });
          }

          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre modifié !" }))
            .catch((error) => res.status(400).json({ message: "Erreur lors de la modification du livre." }));
        });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) => res.status(400).json({ message: "Erreur lors de la modification du livre." }));
      }
    })
    .catch((error) => res.status(400).json({ message: "Erreur lors de la modification du livre." }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé !" }))
          .catch((error) => res.status(400).json({ message: "Erreur lors de la suppression du livre." }));
      });
    })
    .catch((error) => res.status(404).json({ message: "Livre non trouvé." }));
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const existingRating = book.ratings.find(
        (rating) => rating.userId === req.auth.userId
      );

      if (existingRating) {
        return res.status(400).json({ message: "Livre déjà noté par cet utilisateur." });
      }

      const grade = Number(req.body.rating);

      if (isNaN(grade) || grade < 0 || grade > 5) {
        return res.status(400).json({ message: "Note invalide." });
      }

      book.ratings.push({
        userId: req.auth.userId,
        grade: grade
      });

      const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = total / book.ratings.length;

      return book.save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ message: "Erreur lors de l'ajout de la note." }));
    })
    .catch((error) => res.status(404).json({ message: "Livre non trouvé." }));
};