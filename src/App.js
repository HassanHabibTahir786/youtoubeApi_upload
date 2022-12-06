import logo from "./logo.svg";
import "./App.css";
import { useState } from "react";
import axios from "axios";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState("");

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    const postData = await axios.post("http://localhost:4000/upload", formData);
  };
  return (
    <div className="App">
      <input type={"text"} onChange={(e) => setTitle(e.target.value)} />
      <input type={"text"} onChange={(e) => setDescription(e.target.value)} />
      <input type={"file"} onChange={(e) => setVideoFile(e.target.files[0])} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default App;
