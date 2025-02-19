import React from "react";

export function Card({ children, className, onClick }) {
    return (
        <div className={`p-4 bg-white shadow-md rounded-lg ${className}`} onClick={onClick}>
            {children}
        </div>
    );
}
