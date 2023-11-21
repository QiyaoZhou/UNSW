import React from 'react';
import FileUpload from 'react-material-file-upload';

const UploadFile = () => {
  const [upload, setUpload] = React.useState([]);

  // const toBase64 = (file) =>
  //   new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });

  // React.useEffect(() => {
  //   toBase64(upload)
  //     .then(res => console.log(res))
  // }, [upload])
  return (
    <FileUpload value={upload} onChange={setUpload()} />
  )
}

export default UploadFile;
