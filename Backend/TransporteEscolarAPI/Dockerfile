# Imagen de la API para Render (o cualquier servidor con Docker)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY TransporteEscolarAPI.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
# Render envía el tráfico HTTPS ya descifrado a este puerto (ver PORT en render.yaml)
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TransporteEscolarAPI.dll"]
