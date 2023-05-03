import nc from "next-connect";
import ncoptions from "@/config/ncoptions";
import metaplexlib from "@/lib/metaplexlib";

const handler = nc(ncoptions);

//MIDDLEWARE
handler.use(async (req, res, next) => {
    next();
});

handler.post(async (req, res) => {
    const { name, explorerLink, imageUrl, publicKey } = req.body;

    if ((!name || !explorerLink || !imageUrl, !publicKey)) {
        return res.status(400).json({ message: "Bad request mint nft" });
    }

    const nftData = {
        name,
        explorerLink,
        imageUrl,
        publicKey,
    };

    //and start creating nft after 5 seconds.
    try {
        const nftResponse = await metaplexlib.createNFT(nftData);
        res.status(200).json(nftResponse);
    } catch (error) {
        console.error("error =>", error);
        res.status(500).json({ message: "probably didnt get nameString" });
    }
});
export default handler;
