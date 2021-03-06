import { AddressLike } from '@crestproject/crestproject';
import { StandardToken } from '@enzymefinance/protocol';

export async function getAssetBalances({ account, assets }: { account: AddressLike; assets: StandardToken[] }) {
  return Promise.all(assets.map((asset) => asset.balanceOf(account)));
}
