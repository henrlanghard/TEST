import React from "react";

export function Button({ children, onClick, className }) {
    return (
        <button className={`p-2 bg-blue-500 text-white rounded ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}
