import axios from "axios";

export async function getServerSideProps() {
  try {
    const res = await axios.get("http://localhost:3000/api/hellomoon");
    const subscription = res.data;
    return { props: { subscription } };
  } catch (error) {
    console.error(error);
    return { props: { subscription: null } };
  }
}

const HelloMoon = ({ subscription }) => {
  return (
    <div className="h-screen bg-black">
      <div className="flex flex-col  w-auto h-auto  bg-purple-600">
        <div className="flex flex-col py-24 place-items-center justify-center">
          <h1 className="text-white text-3xl text-center">Hello Moon 🌙</h1>
          <p className="text-white text-lg text-center">
            Subscription created: {JSON.stringify(subscription)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelloMoon;
