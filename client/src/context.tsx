import { createContext, useContext } from "react";
import { Localization } from "./localization/localization";

export const LangContext = createContext(null);

export const useLangContext = ()=>{
    return useContext<Localization>(LangContext);
}