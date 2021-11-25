process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0 as any;
import { SupportersList } from './supporters-list/supporters-list';

const buildLehavaFullHost = (hostName?: string, port?: string | number): string | undefined => {
    if (hostName && port) return `${hostName}:${port}`;
    return undefined;
};

export const config = {
    server: {
        port: process.env.PORT || 80,
    },
    auth: {
        callbackURL: process.env.AUTH_CALLBACK_URL || '/auth/callback',
        shragaURL: process.env.SHRAGA_URL || 'http://13.79.7.3',
        useEnrichId: true,
        secret: 'ApPr0vaL_5ySt3m',
        daysExpires: 3,
    },
    client: {
        url: process.env.CLIENT_URL || 'http://localhost:4200',
        requests: {
            GET_NETWORKS_URL: `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/nr?WC=class%3D1000792%20and%20delete_flag%3D0&start=1&size=1000&SORT=z_requests_network_count DESC`,
            GET_FIRST_NETWORK_URL: `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/nr?WC=class%3D1000792%20and%20delete_flag%3D0&start=1&size=1&SORT=z_requests_network_count DESC`,
            GET_SERVICES_URL_FUNCTION: (id: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/z_networks_to_service?WC=network%3D${id}%20and%20delete_flag%3D0%20and%20z_service_family%3D1000106&start=1&size=1000&SORT=z_requests_service_count DESC`,
            GET_OPEN_TASKS_URL_FUNCTION: (UUID: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/cr?WC=customer%3D${UUID}%20and%20type%3D'R'%20and%20active%3D1&SORT=open_date DESC`,
            GET_CLOSED_TASKS_URL_FUNCTION: (UUID: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/cr?WC=customer%3D${UUID}%20and%20type%3D'R'%20and%20active%3D0&SORT=open_date DESC`,
            GET_CATEGORIES_OF_INCIDENTS_URL_FUNCTION: (id: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/pcat?WC=z_impact_service%3D${id}%20and%20delete_flag%3D0&start=1&size=1000`,
            GET_CATEGORIES_OF_REQUESTS_URL_FUNCTION: (id: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/chgcat?WC=z_impact_service%3D${id}%20and%20delete_flag%3D0&start=1&size=1000`,
            GET_UUID_URL_FUNCTION: (userT: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/cnt?WC=userid%3D'${userT}'`,
            GET_TRANSVERSE_URL_FUNCTION: (categoryId: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/cr?WC=category%3D'pcat:${categoryId}'%20and%20active%3D1%20and%20impact%3D1`,
            GET_CATEGORIES_EXCEPTIONS_OF_INCIDENTS: (networkId: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/z_pcat_to_network?WC=network%3D${networkId}&start=1&size=1000`,
            GET_CATEGORIES_EXCEPTIONS_OF_REQUESTS: (networkId: string) =>
                `http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/z_chgcat_to_network?WC=network%3D${networkId}&start=1&size=1000`,
            GET_UPDATES:
                "http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/cr?WC=type%3D'I'%20and%20active%3D1%20and%20impact%3D1&SORT=open_date DESC",
            POST_NEW_REQUEST: 'http://${process.env.LEHAVA_API_HOST}:${process.env.LEHAVA_API_PORT}/caisd-rest/cr',
            GET_HICHAT_IFRAME_URL: '/hichat',
        },
    },
    openConf: {
        homepageTutorialVideoUrl: process.env.HOMEPAGE_TUTORIAL_VIDEO_URL || 'https://www.youtube.com/user/TeslaMotors',
    },
    serviceName: 'tommy-server',
    redis: {
        host: process.env.REDIS_URL || 'redis://localhost:6379',
        lehavaDataKey: process.env.REDIS_LEHAVA_DATA_KEY || 'lehavadata',
        cachedReqsTTL: process.env.CACHED_REQS_TTL ? parseInt(process.env.CACHED_REQS_TTL) : 86400,
        lehavaDataStoredTimeKey: process.env.REDIS_LEHAVA_DATA_TIME_KEY || 'lehavadata:date',
        lehavaDataTTL: process.env.LEHAVA_DATA_TTL ? parseInt(process.env.LEHAVA_DATA_TTL) : 24,
    },
    lehava_api: {
        serverName: process.env.LEHAVA_API_SERVER_NAME || 'localhost',
        host: process.env.LEHAVA_API_HOST || 'localhost',
        port: process.env.LEHAVA_API_PORT || '8050',
        fullHost: buildLehavaFullHost(process.env.LEHAVA_API_HOST, process.env.LEHAVA_API_PORT) || 'lehava-api-mock:8050',
        requestTypesToCache: process.env.REQ_TYPES_TO_CACHE?.split(',') || [
            'nr',
            'z_networks_to_service',
            'pcat',
            'chgcat',
            'z_pcat_to_network',
            'z_chgcat_to_network',
        ],
        getRequestWithFileUrl: (
            reqUrl: string,
            fileObject: {
                name: string;
                type: string;
                base64: string;
            },
        ): string =>
            `${reqUrl.split('/file')[1]}?repositoryId=1002&serverName=${config.lehava_api.serverName}&mimeType=${fileObject.type}&description=${
                fileObject.name
            }`,
        getFormDataBody: (
            postType: string,
            postObject: any,
            file: {
                name: string;
                type: string;
                base64: string;
            },
        ): string =>
            `--*****MessageBoundary*****\r
Content-Disposition: form-data; name="${postType}"
Content-Type: application/xml; CHARACTERSET=UTF-8
\r
<${postType}>
${
    postType === 'chg'
        ? `<requestor id="${postObject.requestor['@id']}"/>
<category id="${postObject.category['@id']}"/>`
        : `<customer id="${postObject.customer['@id']}"/>
<category REL_ATTR="${postObject.category['@REL_ATTR']}"/>`
}
<z_cst_phone>${postObject.z_cst_phone}</z_cst_phone>
<priority id="${postObject.priority['@id']}"/>
<Urgency id="${postObject.Urgency['@id']}"/>
<z_ipaddress>${postObject.z_ipaddress}</z_ipaddress>
<z_username>${postObject.z_username}</z_username>
<z_computer_name>${postObject.z_computer_name}</z_computer_name>
<z_current_loc>${postObject.z_current_loc}</z_current_loc>
<z_cst_red_phone>${postObject.z_cst_red_phone}</z_cst_red_phone>
<z_network id="${postObject.z_network['@id']}"/>
<z_impact_service id="${postObject.z_impact_service['@id']}"/>
<description>${postObject.description}</description>
<z_source id="${postObject.z_source['@id']}"/>
<impact id="${postObject.impact['@id']}"/>
</${postType}>
\r
--*****MessageBoundary*****\r
Content-Disposition: form-data; name="${file.name}"; filename="${file.name}"
Content-Type: application/octet-stream
Content-Transfer-Encoding: base64
\r
${file.base64}
\r
--*****MessageBoundary*****--\r`,
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        access_token_return_queue: 'access_token_return',
        access_token_rpc_queue: 'access_token_rpc',
        logger_queue_name: 'log_queue',
        msg_timeout: parseInt(process.env.RABBITMQ_TIMEOUT || '1000'),
    },

    chat: {
        chatUrl: process.env.CHAT_URL || 'http://lehava-api-mock:8050/api/v1',
        hiChatUrl: process.env.HI_CHAT_URL || 'http://lehava-api-mock:8050/api/v1',
        chatGroupUrl: process.env.CHAT_GROUP_URL || 'groups',
        chatLoginUrl: process.env.CHAT_LOGIN_URL || 'login',
        chatMessageUrl: process.env.CHAT_MESSAGE_URL || 'chat',
        loginUser: process.env.LOGIN_USER || 'tommy',
        loginPass: process.env.LOGIN_PASS || 'Aa123456',
        getSupportUsers: async () => {
            try {
                return (await SupportersList.getSupportersList()) || process.env.SUPPORT_USERS?.split(',') || [];
            } catch (e) {
                return process.env.SUPPORT_USERS?.split(',') || [];
            }
        },
        hiChatGroupTitle: (userT: string) => `${process.env.HI_CHAT_ROOM_NAME} ${userT}` || `Tommy Support Room ${userT}`,
        hiChatTaskMessageStructure: (taskId: string, taskDate: string, taskLink: string) =>
            `היי, אשמח לעזרה בפנייה מספר: ${taskId}, שנפתחה ב ${taskDate}. ${taskLink ? `לינק בלהבה: ${taskLink}` : 'לא קיים לינק בלהבה'}`,
        announcement: process.env.HI_ANNOUNCEMENT || 'שעות המענה הן 08:00-17:00',
    },
};
