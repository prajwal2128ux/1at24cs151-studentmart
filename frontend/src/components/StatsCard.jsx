
import React from "react";

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) => {
  return (
    <div className="stats-card">

      <div className="stats-card-top">
        <div className={`stats-icon ${color}`}>
          <Icon size={23} />
        </div>
      </div>

      <div className="stats-value">
        {value}
      </div>

      <h3>{title}</h3>

      <p>{subtitle}</p>

    </div>
  );
};

export default StatsCard;
