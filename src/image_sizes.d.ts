/** Tamanho original de cada PNG de assets/ (vite.config.ts, plugin imageSizes): caminho → [largura, altura]. */
declare module 'virtual:image-sizes' {
  const sizes: Record<string, [number, number]>;
  export default sizes;
}
