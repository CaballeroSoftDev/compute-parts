import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="mb-4 flex justify-center">
            <div className="text-2xl font-bold text-black">
              Compu<span className="text-[#007BFF]">Parts</span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Cargando Perfil</CardTitle>
          <CardDescription className="text-center">Estamos cargando tu información...</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#007BFF]"></div>
          </div>
          <p className="text-sm text-gray-600">Por favor espera mientras cargamos tu perfil.</p>
        </CardContent>
      </Card>
    </div>
  );
}
