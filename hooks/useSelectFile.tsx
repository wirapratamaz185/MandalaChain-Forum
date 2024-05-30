import React, { useState } from "react";
import useCustomToast from "./useCustomToast";

const useSelectFile = (maxHeight: number, maxWidth: number) => {
  const [selectedFile, setSelectedFile] = useState<string>();
  const showToast = useCustomToast();

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // get the first file
    const maxImageSize = 10; // 10MB
    const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"]; // only allow image file types

    // check if file exists
    if (file) {
      // check if file size is too large
      if (file.size > maxImageSize * 1024 * 1024) {
        showToast({
          title: "File size is too large",
          description: `Maximum file size is ${maxImageSize}MB.`,
          status: "error",
        });
        return; // exit function
      }
      // check if file type is allowed
      if (!allowedFileTypes.includes(file.type)) {
        showToast({
          title: "File type not allowed",
          description: `Only image file types are allowed (.png / .jpeg / .gif).`,
          status: "error",
        });
        return; // exit function
      }

      // check image dimensions
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        if (image.width > maxWidth || image.height > maxHeight) {
          showToast({
            title: "Image dimensions are too large",
            description: `Maximum dimensions are ${maxWidth}x${maxHeight}.`,
            status: "error",
          });
          return; // exit function
        }

        // resize image
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        ctx?.drawImage(image, 0, 0, image.width, image.height);
        const resizedImage = canvas.toDataURL("image/jpeg", 1.0);

        setSelectedFile(resizedImage); // set the selected file
      };
    }
  };
  return {
    selectedFile,
    setSelectedFile,
    onSelectFile,
  };
};
export default useSelectFile;
