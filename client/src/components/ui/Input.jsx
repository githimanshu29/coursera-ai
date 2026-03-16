const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  className = "",
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm text-gray-400 font-medium">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 rounded-lg bg-gray-800/50 border ${
          error ? "border-red-500" : "border-gray-700"
        } text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors duration-200 ${className}`}
        {...rest}
      />
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
};

export default Input;