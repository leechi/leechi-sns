import { addDoc, collection, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function PostTweetForm(){
    const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      setFile(files[0]);
    }
  };
  const onSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{

    e.preventDefault();
    const user = auth.currentUser
    if(!user || isLoading || tweet === "" || tweet.length > 180) return;
    try{
      setLoading(true)
      const doc = await addDoc(collection(db, "tweets"), {
        tweet,
        createdAt: Date.now(),
        username: user.displayName || "Anonymous",
        userId: user.uid,

      })
      if(file){
        const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc, {
          photo: url
        })
      }
      setTweet("");
      setFile(null);
    }catch(e){
      console.log(e);
    }finally{
      setLoading(false);
    }
  }
    return (
        <form onSubmit={onSubmit} className="post-tweet-form">
            <section className="post__box">
                <textarea maxLength={180} onChange={onChange} value={tweet} rows={5} placeholder="어떤 팀원을 모집하시나요?">
                </textarea>
                <hr className="post__line"/>
                <div className="post__bottom">
                    <label htmlFor="photo"><img src="photo.svg" alt="Add photo" /></label>
                    <input type="file" id="photo" onChange={onFileChange} accept="image/*" />
                    <input className="post__btn" type="submit" value={isLoading ? "Posting..." : "Post"} />
                </div>
            </section>
        

        </form>
    )
}