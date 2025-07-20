type ImageSize = {
  width: number;
  height: number;
};
type ViewportSize = {
  width: number;
  height: number;
};

export const getScaleFitImageToViewport = (args: {
  imgSize: ImageSize;
  viewPortSize: ViewportSize;
}) => {
  const { imgSize, viewPortSize } = args;

  const isFitHorizontal =
    imgSize.width / viewPortSize.width > imgSize.height / viewPortSize.height;

  let scale: number;
  if (isFitHorizontal) {
    scale = Math.round((viewPortSize.width / imgSize.width) * 10) / 10;
  } else {
    scale = Math.round((viewPortSize.height / imgSize.height) * 10) / 10;
  }
  return {
    scale,
    isFitHorizontal,
  };
};

export const resizeBase64Image = async (
  base64ImgUrl: string,
  width: number,
  height: number
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  canvas.width = width;
  canvas.height = height;
  const img = new Image();
  img.src = base64ImgUrl;

  const newBase64Img = await new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
  });
  console.log("Resized image to", width, height);

  return newBase64Img as string;
};
