const Button = ({ children, onClick, variant = "default" }) => {
  return (
    <button
      className={`px-4 py-2 rounded-md transition-all duration-300 ${
        variant === "outline"
          ? "border border-gray-400 text-gray-700 hover:bg-gray-100"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
