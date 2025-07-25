import React from 'react'

function SelectOptions({ type, name,labelText, defaultValue = "" }) {
  return (
    <div className="form-row">
      <label htmlFor={name} className="form-label">
        {labelText || name}
      </label>
      <select
        className="form-input"
        name={name}
        id={name}
        defaultValue={defaultValue}
      >
        <option className="form-input" value="chooseoption">
          choose option
        </option>
        <option value="doctor">doctor</option>
        <option value="patient">patient</option>
        <option value="admin">admin</option>
      </select>
    </div>
  );
}

export default SelectOptions