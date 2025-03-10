import React from 'react';
import './Modal.css';

// Modal.js에서 수정된 코드
const Modal = ({ isOpen, closeModal, title, content }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-con" onClick={(e) => e.stopPropagation()}>
          <div className='modal-con-header'>
            <h2>{title}</h2>
            <button onClick={closeModal} id='modal-btn'>×</button>
          </div>
          <p>{content}</p>
          
        </div>
      </div>
    );
  };
  

export default Modal;
