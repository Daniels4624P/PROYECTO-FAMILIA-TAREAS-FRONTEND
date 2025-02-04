import { useState } from "react"
import Loader from "./Loader"

const withLoader = (WrappedComponent) => {
  return function WithLoaderComponent(props) {
    const [isLoading, setIsLoading] = useState(false)

    const setLoading = (loading) => {
      setIsLoading(loading)
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-notion-bg dark:bg-notion-dark">
          <Loader size="large" />
        </div>
      )
    }

    return <WrappedComponent {...props} setLoading={setLoading} />
  }
}

export default withLoader

