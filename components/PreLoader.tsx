import React from 'react'

const PreLoader = () => {
    const text = "Silver Taxi";
    const rings = 2;
    const ringSectors = 30;
  
    const styleCenter = {
      display: "flex",
      justifyContent: "center", 
      alignItems: "center",
      height: "90vh",
      width: "100dvw",
    }
  
    return (
      <div className="preloader-container">
        <div className="preloader" style={styleCenter}>
          {Array.from({ length: rings }).map((_, r) => (
            <div className="preloader__ring" key={`ring-${r}`}>
              {Array.from({ length: ringSectors }).map((_, s) => (
                <div className="preloader__sector" key={`sector-${s}`}>
                  {text[s] || ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };


export default PreLoader