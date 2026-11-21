/**
 * Utilitário para redimensionar e otimizar fotos enviadas da galeria/celular.
 * Converte imagens pesadas (ex: 5MB a 15MB) para versões web leves (~70KB - 120KB) em formato JPEG.
 */
export async function compressAndResizeImage(
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantém a proporção redimensionando para o limite máximo
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'));
          return;
        }

        // Fundo branco caso haja transparência em PNG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Erro ao ler a imagem selecionada.'));
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Erro ao abrir o arquivo da galeria.'));
    reader.readAsDataURL(file);
  });
}
