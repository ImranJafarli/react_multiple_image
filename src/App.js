import { useState, useEffect } from "react";
import axios from "axios";
const ImageTypeRegex = /(?:jpg|gif|jpeg|png)/g;

function App() {
  const [imageFiles, setImageFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [myImage, setMyImage] = useState([]);
  const [updateImages, setUpdateImages] = useState(false);

  const ChangeHandler = (e) => {
    const { files } = e.target;
    const validImageFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match(ImageTypeRegex)) {
        validImageFiles.push(file);
      }
    }
    if (validImageFiles.length) {
      setImageFiles(validImageFiles);
    } else {
      alert("Selected images are not of valid type!");
    }
  };

  useEffect(() => {
    const images = [];
    const fileReaders = [];
    let isCancel = false;
    if (imageFiles.length) {
      imageFiles.forEach((file) => {
        const fileReader = new FileReader();
        fileReaders.push(fileReader);
        fileReader.onload = (e) => {
          const { result } = e.target;
          if (result) {
            images.push(result);
          }
          if (images.length === imageFiles.length && !isCancel) {
            setImages(images);
          }
        };
        fileReader.readAsDataURL(file);
      });
    }
    return () => {
      isCancel = true;
      fileReaders.forEach((fileReader) => {
        if (fileReader.readyState === 1) {
          fileReader.abort();
        }
      });
    };
  }, [imageFiles]);

  const sendImages = (event) => {
    event.preventDefault();
    axios.post("http://localhost:9000/create-user", images).then(() => {
      setUpdateImages(!updateImages);
    });
  };

  useEffect(() => {
    axios("http://localhost:9000/login").then((res) => {
      const allImages = [].concat(...res.data);
      setMyImage(allImages);
      console.log(allImages);
    });
  }, [updateImages]);

  return (
    <div className="App">
      <form onSubmit={sendImages}>
        <p>
          <label htmlFor="file">Upload Images</label>
          <input
            type="file"
            id="file"
            onChange={ChangeHandler}
            accept="image/png,image/jpg,image/jpeg"
            multiple
          />
        </p>
        <input type="submit" value="Submit" />
      </form>
      <div>
        {myImage.map((image, idx) => (
          <p key={idx}>
            <img src={image} alt="image" />
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
