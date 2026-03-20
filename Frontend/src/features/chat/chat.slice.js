import {createSlice} from "@reduxjs/toolkit"

const chatSlice = createSlice({
    name:'chat',
    initialState:{
        chats:{},
        currentChatId:null,
        isLoading:false,
        error:null,
    },
    reducers:{
        createNewChat(state,action){
            const {chatId,title} = action.payload
            state.chats[chatId] = {
                id: chatId,
                title,
                messages:[],
                lastUpdated: new Date().toISOString()
            }
            
        },
        addNewMessage(state,action){
            const {chatId,content,role} = action.payload
            state.chats[chatId].messages.push({content,role})
        },
        setChats(state,action){
            state.chats = action.payload
        },
        setCurrentChatId(state,action){
            state.currentChatId = action.payload
        },
        setLoading(state,action){
            state.isLoading = action.payload
        },
        setError(state,action){
            state.error = action.payload
        }

    }
    
})

export const {setChats,setCurrentChatId,setLoading,setError,createNewChat,addNewMessage} = chatSlice.actions

export default chatSlice.reducer

// chats = {
//     "docker and AWS":{
//         messages:[
//             {
//                 role:"user",
//                 content:"what is docker?"
//             },
//             {
//                 role:"ai",
//                 content:"docker is a containerization platform"
//             }
//         ],
//         id:"docker and AWS",
//         lastUpdated: "2024-06-20T12:00:00Z"
//     }
        
// }