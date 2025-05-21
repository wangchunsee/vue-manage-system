export interface Menus {
    id: string;
    pid?: string;
    icon?: string;
    index: string;
    title: string;
    permiss?: string;
    noAuth?: boolean;
    children?: Menus[];
}
