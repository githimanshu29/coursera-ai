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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm text-gray-400 font-medium">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl bg-gray-800/60 border ${
          error ? "border-red-500/50" : "border-gray-700/50"
        } text-white text-sm placeholder-gray-600 
        focus:outline-none focus:border-purple-500/70 focus:bg-gray-800/80
        hover:border-gray-600/70
        transition-all duration-200 ${className}`}
        {...rest}
      />
      {error && <span className="text-red-400 text-xs mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;