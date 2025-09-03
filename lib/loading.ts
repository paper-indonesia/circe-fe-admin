let isLoading = false

export const setLoading = (loading: boolean) => {
  isLoading = loading
}

export const getLoading = () => isLoading
