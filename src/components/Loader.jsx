const Loader = ({ size = "default" }) => {
    const sizeClasses = {
      small: "w-5 h-5",
      default: "w-8 h-8",
      large: "w-12 h-12",
    }
  
    return (
      <div className="flex justify-center items-center">
        <div
          className={`${sizeClasses[size]} border-4 border-notion-gray dark:border-notion-text-dark rounded-full border-t-notion-orange animate-spin transition-colors duration-300`}
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }
  
  export default Loader
  
  