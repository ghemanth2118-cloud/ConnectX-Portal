import { API_PATHS } from "../apiPaths";
import axiosInstance from "./axiosinstance";
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  try {
    const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // SET HEADER FOR FILE UPLOAD
      },
    });
    return response.data;// RETURN RESPONSE DATA
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export default uploadImage;