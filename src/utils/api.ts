import createClient from "openapi-fetch";
import { paths } from "./eve";

const { GET, PUT } = createClient<paths>({ baseUrl: "https://esi.evetech.net/latest" });

export type CharacterProfile = paths['/characters/{character_id}/']['get']['responses']['200']['schema'];

export const character = async (token: string, id: number) => await GET("/characters/{character_id}/", {
    params: {
        path: {
            character_id: id
        },
        query: {
            datasource: "tranquility",
        },
        header: {
            "If-None-Match": undefined
        }
    },
    headers: {
        "Authorization": `Bearer ${token}`,
    }
});

export type CharacterPortraits = paths['/characters/{character_id}/portrait/']['get']['responses']['200']['schema'];

export const portrait = async (token: string, id: number) => await GET("/characters/{character_id}/portrait/", {
    params: {
        path: {
            character_id: id
        },
        query: {
            datasource: "tranquility",
        },
        header: {
            "If-None-Match": undefined
        }
    },
    headers: {
        "Authorization": `Bearer ${token}`,
    }
});