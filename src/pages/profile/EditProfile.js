import React, { useEffect, useState } from "react";
import "./Profile.scss";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/auth/authSlice";
import Loader from "../../component/loader/Loader";
import Card from "../../component/card/Card";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateUser } from "../../services/authService";
import ChangePassword from "../../component/changePassword/ChangePassword";

const EditProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const { email } = user;

  useEffect(() => {
    if (!email) {
      navigate("/profile");
    }
  }, [email, navigate]);

  const initialState = {
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    bio: user?.bio,
    photo: user?.photo,
  };

  const [profile, setProfile] = useState(initialState);
  const [profileImage, setProfileImage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Handle Image upload
      let imageURL;
      if (
        profileImage &&
        (profileImage.type === "image/jpeg" ||
          profileImage.type === "image/jpg" ||
          profileImage.type === "image/png")
      ) {
        const image = new FormData();
        image.append("file", profileImage);
        image.append("cloud_name", "dwbe7u3qk");
        image.append("upload_preset", "pkarqjp3");

        //first save image to cloudinary
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dwbe7u3qk/image/upload",
          { method: "post", body: image }
        );
        const imageData = await response.json();
        imageURL = imageData.url.toString();
      }
      
      //save profile
      const formData = {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        photo: profileImage ? imageURL : profile.photo,
      };

      const data = await updateUser(formData);
      console.log(data);
      toast.success("User updated");
      navigate("/profile");
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="profile --my2">
      {isLoading && <Loader />}
      <Card cardClass={"card --flex-dir-column"}>
        <span className="profile-photo">
          <img src={user?.photo} alt="profilepic" />
        </span>
        <form className="--form-control --m" onSubmit={saveProfile}>
          <span className="profile-data">
            <p>
              <label>Name: </label>
              <input
                type="text"
                name="name"
                value={profile?.name}
                onChange={(e) => handleInputChange(e)}
              />
            </p>
            <p>
              <label>Email: </label>
              <input type="text" name="email" value={profile?.email} disabled />
              <br />
              <code>Email cannot be changed</code>
            </p>
            <p>
              <label>Phone: </label>
              <input
                type="text"
                name="phone"
                value={profile?.phone}
                onChange={(e) => handleInputChange(e)}
              />
            </p>
            <p>
              <label>Bio:</label>
              <br />
              <textarea
                name="bio"
                value={profile?.bio}
                onChange={handleInputChange}
                cols="30"
                rows="10"
              ></textarea>
            </p>
            <p>
              <label>Photo: </label>
              <input
                type="file"
                name="image"
                onChange={(e) => handleImageChange(e)}
              />
            </p>
            <div>
              <button className="--btn --btn-primary">Edit</button>
            </div>
          </span>
        </form>
      </Card>
      <br />
      <ChangePassword/>
    </div>
  );
};

export default EditProfile;
