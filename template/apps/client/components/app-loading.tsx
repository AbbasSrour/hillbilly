export function AppLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-primary border-t-2 border-b-2" />
        <h2 className="font-semibold text-xl">Loading...</h2>
      </div>
    </div>
  );
}
