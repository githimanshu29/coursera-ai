const Loader = ({ size = "md", text = "" }) => {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
};

export default Loader;