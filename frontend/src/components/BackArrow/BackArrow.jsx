import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function BackArrow() {
  return (
    <Link to="/" className="backArrow">
      <FontAwesomeIcon icon={faArrowLeft} />
      {' Retour'}
    </Link>
  );
}

export default BackArrow;