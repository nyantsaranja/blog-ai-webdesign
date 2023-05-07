import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import {BASE_URL, CONFIG} from "../service/Api-Call";
import Swal from "sweetalert2";
import {formatDate, getAuthorId} from "../service/Utility";

export const AddArticle = () => {
    const [ckData, setCkData] = useState('');
    const summaryRef = useRef(null);
    const subtitleRef = useRef(null);
    const titleRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const base64Ref = useRef(null);
    const [previewImage, setPreviewImage] = useState(null);

    const fileSelectedHandler = event => {
        const file = event.target.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            // create preview image
            const reader = new FileReader();
            // resizes the image 200px width while maintaining aspect ratio
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            }
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreviewImage(null);
        }
    };

    const validateFile = file => {
        // check file type
        if (!file.type.includes('image/')) {
            alert('Please select an image file.');
            return false;
        }
        // check file size
        if (file.size / 1024 / 1024 > 5) {
            alert('File size must be less than 5 MB.');
            return false;
        }
        return true;
    };

    const fileUploadHandler = async () => {
        // create canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // create image element
        const img = new Image();
        let bs64 = null;
        img.onload = () => {
            // calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;
            let ratio = 1;

            if (width > 300 || height > 300) {
                // calculate ratio to fit within 200x200 bounds
                ratio = Math.min(300 / width, 300 / height);
                width *= ratio;
                height *= ratio;
            }

            // set canvas dimensions to match image dimensions
            canvas.width = width;
            canvas.height = height;

            // draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // get optimized base64 image
            bs64 = canvas.toDataURL('image/jpeg', 0.8);
            // console.log(base64);
            const article = {
                summary: summaryRef.current.value,
                title: titleRef.current.value,
                subtitle: subtitleRef.current.value,
                content: ckData,
                image: bs64,
                author: {
                    id: getAuthorId()
                },
                publicationDate: new Date()
            }
            console.log(article);
            axios.post(`${BASE_URL}/article`, article,CONFIG).then((response) => {
                    console.log(response.data);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Data saved successfully'
                    })
                    summaryRef.current.value = '';
                    titleRef.current.value = '';
                    setCkData('');
                    subtitleRef.current.value = '';
                }
            ).catch((error) => {
                    alert(error.response.data.message);
                }
            );
        };

        // set image source to preview image
        img.src = previewImage;
    };

    return (
        <>
            <div className="card">
                <div className="card-body">

                    <form>
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">Title</label>
                            <input ref={titleRef} type="text" className="form-control" id="title"
                                   placeholder="Title"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1" className="form-label">Subtitle</label>
                            <input ref={subtitleRef} type="text" className="form-control" id="subtitle"
                                   placeholder="Subtitle"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1" className="form-label">Summary</label>
                            <textarea ref={summaryRef} className="form-control" rows="5"
                                      placeholder="Type something..."></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1" className="form-label">Content</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data="Write the content here!"
                                onReady={editor => {
                                    setCkData('<p>Hello from CKEditor 5!</p>')
                                }}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    console.log({event, editor, data});
                                    setCkData(data)
                                }}
                            />
                        </div>
                        {/*add input file for uploading and image*/}
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1" className="form-label">Illustration</label>
                            <input onChange={fileSelectedHandler} type="file" className="form-control" id="image"/>
                            <div style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: "10px"
                            }}>
                                {previewImage &&
                                    <img src={previewImage} alt="Preview" style={{
                                        maxWidth: '300px',
                                        maxHeight: '300px',
                                        width: 'auto',
                                        height: 'auto'
                                    }}/>}

                            </div>
                        </div>

                        <button onClick={fileUploadHandler} type="button" className="btn btn-primary">Save</button>
                    </form>
                </div>
            </div>
        </>
    );
}