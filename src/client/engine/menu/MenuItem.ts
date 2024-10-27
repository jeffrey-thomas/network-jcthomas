import { MenuInput } from "./MenuInput"

/**
 * An option for a menu
 * label - the text to display on the button
 * action - the method to call when the button is clicked
 */
export type MenuItem = {
    label: string,
    action: (input?:string) => void,
    input?:MenuInput
}

export namespace MenuItem {
    /**
     * Check if two menu items are equal
     * @param item1 first menu item to check
     * @param item2 second menu item to check
     * @returns whether the items are equal
     */
    export const equal = (item1: MenuItem, item2: MenuItem) => {
        return item1.label === item2.label && item1.action === item2.action
    }
}