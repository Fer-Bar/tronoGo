export interface FilterState {
    type: ("male" | "female" | "unisex")[]
    isAccessible: boolean | null
    hasBabyChanger: boolean | null
    hasPaper: boolean | null
    hasSoap: boolean | null
    isFree: boolean | null
}
