import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Breadcrumbs = ({ items, showBackButton = true, backTo = null }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span className="mr-1">←</span>
          Back
        </button>
      )}

      {items && items.length > 0 && (
        <>
          {showBackButton && <span className="text-gray-300">|</span>}
          <nav className="flex items-center space-x-2">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-300">/</span>}
                {item.href && index < items.length - 1 ? (
                  <Link
                    to={item.href}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      index === items.length - 1
                        ? "text-gray-900 font-medium"
                        : "text-gray-600"
                    }
                  >
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </>
      )}
    </div>
  );
};

export default Breadcrumbs;