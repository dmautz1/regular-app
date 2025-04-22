import { useState } from "react";

const Checkbox = ({ handleClick, isChecked, disabled = false }) => {
    // Determine className based on both checked state and disabled state
    const getClassName = () => {
        let className = isChecked ? "checked" : "empty";
        if (disabled) className += " disabled";
        return className;
    };

    // Only call handleClick if not disabled
    const onClick = (e) => {
        if (!disabled) {
            handleClick(e);
        }
    };

    return (
        <button className={getClassName()} onClick={onClick} disabled={disabled}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path className="checkmark" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
            </svg>
            <svg className={`explosion explosion-lg ${isChecked ? "exploding" : "empty"}`} viewBox="0 0 108 108" 
                sx={{fillRule:'evenodd', clipRule:'evenodd', strokeLinejoin:'round', strokeMiterLimit:2}}>
                <circle className="alternate" cx="20.977" cy="20.977" r="7.451" />
                <circle className="alternate" cx="86.293" cy="20.977" r="7.451" />
                <circle cx="7.451" cy="53.636" r="7.451" />
                <circle cx="53.636" cy="99.822" r="7.451" />
                <circle cx="99.822" cy="53.636" r="7.451" />
                <circle cx="53.636" cy="7.451" r="7.451" />
                <path className="alternate"
                d="M91.563 91.563a7.454 7.454 0 0 0 0-10.537 7.456 7.456 0 0 0-10.537 0 7.456 7.456 0 0 0 0 10.537 7.454 7.454 0 0 0 10.537 0Z" />
                <circle className="alternate" cx="20.977" cy="86.293" r="7.451" />
            </svg>
            <svg className={`explosion explosion-sm ${isChecked ? "exploding" : "empty"}`} viewBox="0 0 108 108" 
                sx={{fillRule:'evenodd', clipRule:'evenodd', strokeLinejoin:'round', strokeMiterLimit:2}}>
                <circle className="alternate" cx="20.977" cy="20.977" r="7.451" />
                <circle className="alternate" cx="86.293" cy="20.977" r="7.451" />
                <circle cx="7.451" cy="53.636" r="7.451" />
                <circle cx="53.636" cy="99.822" r="7.451" />
                <circle cx="99.822" cy="53.636" r="7.451" />
                <circle cx="53.636" cy="7.451" r="7.451" />
                <path className="alternate"
                d="M91.563 91.563a7.454 7.454 0 0 0 0-10.537 7.456 7.456 0 0 0-10.537 0 7.456 7.456 0 0 0 0 10.537 7.454 7.454 0 0 0 10.537 0Z" />
                <circle className="alternate" cx="20.977" cy="86.293" r="7.451" />
            </svg>
        </button>
    );
  };
  export default Checkbox;