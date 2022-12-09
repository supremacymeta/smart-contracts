import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import { parseUnits, parseEther } from "@ethersproject/units"
export const parse18 = (num: BigNumberish) => {
	return parseUnits(num.toString(), 18)
}
