import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database


let anon_key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlb2llZHhncnF5cW1qZmZlYWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3NDE2NDQsImV4cCI6MjA1MzMxNzY0NH0.K0QPkMSh_5uF2zHYVX_Hkl4QCVpJjHtBZnLyRvoQz3E";
const supabaseUrl = "https://veoiedxgrqyqmjffeagh.supabase.co";

const supabase = createClient(supabaseUrl, anon_key);

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  // useEffect(() => {

  //   // postData();
  // }, [selectedFile]);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      // console.log("first",e.target.files )
      // console.log(e.target.files[0] )
      // setSelectedFile(URL.createObjectURL(e.target.files[0]));
      // console.log(URL.createObjectURL(e.target.files[0]) )
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    let fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("Filex")
      .upload(fileName, file);

    const urlInfo = supabase.storage.from("Filex").getPublicUrl(data.path);

    console.log("uploaded data", urlInfo.data.publicUrl);
    setSelectedFile(urlInfo.data.publicUrl);
  };

  const handleShare = async () => {
    console.log("Post Shared", {
      image: selectedFile,
    });

    let response = await axios.post("http://localhost:3000/post", {
      file: selectedFile,
    });

    console.log("RESPONSE", response);
  };

  return (
    <div>
      <img src={selectedFile} style={{ height: "100px", width: "100px" }} />
      <br />
      <label>
        <span style={{ color: "white", paddingRight: "20px" }}>
          Selec a Photo
        </span>
        <input type="file" onChange={handleImageUpload} />
      </label>
      <br />
      <br />
      <button onClick={handleShare}>Upload</button>
    </div>
  );
}

export default FileUpload;
