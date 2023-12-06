import { BigNumber, ethers } from "ethers";
import Erc721 from "./interfaces/Erc721Interface";
import { getNFTAddress } from "./untils/getAddress";
import { getRPC } from "./untils/common";
import { getNFTAbi } from "./untils/getAbis";
import { INftItem } from "@/_types";

export default class NftContract extends Erc721 {
  constructor(provider?: ethers.providers.Web3Provider) {
    const rpcProvider = new ethers.providers.JsonRpcProvider(getRPC());
    super(provider || rpcProvider, getNFTAddress(), getNFTAbi());
    if (!provider) {
      this._contract = new ethers.Contract(
        this._contractAddress,
        this._abis,
        rpcProvider
      );
    }
  }

  private _listTokenIds = async (address: string) => {
    const urls: BigNumber[] = await this._contract.listTokenIds(address);
    console.log({ urls });
    const ids = await Promise.all(urls.map((id) => this._toNumber(id)));
    console.log({ ids });
    return ids;
  };

  getListNFT = async (address: string): Promise<INftItem[]> => {
    console.log({ address });
    const ids = await this._listTokenIds(address);
    return Promise.all(
      ids.map(async (id) => {
        const tokenUrl = await this._contract.tokenURI(id);
        const obj = await (await fetch(`${tokenUrl}.json`)).json();
        const item: INftItem = { ...obj, id };
        return item;
      })
    );
  };

  getNftInfo = async (nfts: Array<any>) => {
    return Promise.all(
      nfts.map(async (o: any) => {
        const tokenUrl = await this._contract.tokenURI(o.tokenId);
        const obj = await (await fetch(`${tokenUrl}.json`)).json();
        const item: INftItem = {
          ...obj,
          id: o.tokenId,
          author: o.author,
          price: o.price,
        };
        return item;
      })
    );
  };
}