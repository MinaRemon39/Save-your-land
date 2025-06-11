import React from 'react';
import { useTranslation } from 'react-i18next';

export default function InputField({
  type = 'text',
  iconClass = '',
  placeholderKey = '',
  value,
  onChange,
  required = true,
  autoComplete = 'off',
  maxLength,
  pattern,
  showStrengthBar = false,
  strength = null,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div
      className="input-field d-flex align-items-center p-3"
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        textAlign: isRTL ? 'right' : 'left'
      }}
    >
      <i
        className={`${iconClass} text-black-50 ${isRTL ? 'ms-2' : 'me-2'}`}
        style={isRTL ? { marginLeft: '8px' } : { marginRight: '8px' }}
      ></i>
      <input
        type={type}
        placeholder={t(placeholderKey)}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        style={{ direction: isRTL ? 'rtl' : 'ltr', flex: 1 }}
      />
      {showStrengthBar && strength?.strength && (
        <div id="password-strength" style={{ color: strength.color }}>
          Strength: {strength.strength}
        </div>
      )}
    </div>
  );
}