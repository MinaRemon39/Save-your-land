import os
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from .db_config import get_connection , get_soil_data , get_conversation_history , upsert_conversation_history , insert_disease
from fastapi.middleware.cors import CORSMiddleware

#Set the LLM
os.environ["GOOGLE_API_KEY"] = "AIzaSyCvnZdgNEhB90crbt8H_EGfW0BnqaPzqoI"
llm= ChatGoogleGenerativeAI(model='gemini-2.0-flash-001')


#Set Prompts
soil_analysis_prompt = PromptTemplate(
    input_variables=[
        "history", "input",
        "soil_ph", "soil_moisture", "soil_air", "soil_temp", "ambient_temp",
        "humidity", "light_intensity", "nitrogen_level", "potassium_level", "phosphorus_level",
        "chlorophyll_content", "electrochemical_signal", "organic_matter", "soil_type", "disease", "plant_status","plant_type"
    ],
    template="""
    أنت خبير في تحليل التربة وصحة النباتات.

    المحادثة السابقة:
    {history}

    بيانات التربة والنبات:
    1. pH التربة: {soil_ph}
    2. رطوبة التربة: {soil_moisture}%
    3. هواء التربة: {soil_air}
    4. درجة حرارة التربة: {soil_temp}°C
    5. درجة الحرارة المحيطة: {ambient_temp}°C
    6. الرطوبة في الهواء: {humidity}%
    7. شدة الإضاءة: {light_intensity} Lux
    8. النيتروجين: {nitrogen_level} mg/kg
    9. البوتاسيوم: {potassium_level} mg/kg
    10. الفسفور: {phosphorus_level} mg/kg
    11. الكلوروفيل: {chlorophyll_content} mg/m²
    12. الإشارة الكهربائية الكيميائية: {electrochemical_signal} mV
    13. المادة العضوية: {organic_matter}%
    14. نوع التربة: {soil_type}
    15. المرض الظاهر: {disease}
    16. حالة النبات: {plant_status}
    17. نوع المحصول: {plant_type}

    الطلب الحالي:
    {input}

    التعليمات:

    1. إذا كان إدخال المستخدم يحتوي على رموز أو حروف غير مفهومة (مثل "؟؟؟" أو "زز" أو "asdfg")، أخبره بلطف أن السؤال غير واضح واطلب منه إدخال استفسار واضح له علاقة بالزراعة فقط.

    2. إذا كان الإدخال عبارة عن تحية أو جملة عامة غير متعلقة مباشرة بالزراعة (مثل "أهلاً" أو "كيف حالك؟" أو "السلام عليكم")، اكتفِ برد بسيط مثل: "مرحبًا! كيف أقدر أساعدك في الزراعة؟" ولا تستخدم بيانات التربة إطلاقًا في هذا الرد.

    3. إذا كان السؤال لا علاقة له بالزراعة (مثال: "ما هي عاصمة فرنسا؟" أو "ما الطقس في كندا؟")، أخبره بلطف أن تخصصك هو الزراعة وتحليل التربة، واطلب منه إدخال سؤال له علاقة بذلك.

    4. فقط إذا كان السؤال واضحًا ومباشرًا ويتعلق بالزراعة أو صحة النبات أو التربة، استخدم البيانات أعلاه للإجابة عليه بدقة، بشكل نقاط أو فقرات مرتبة، وبأسلوب بسيط وسهل التطبيق.

    5. في نهاية كل رد مفيد، اسأل المستخدم: "هل عندك أي سؤال تاني أقدر أساعدك فيه؟"
    """
)

plant_disease_prompt = PromptTemplate(
    input_variables=["disease_name"],
    template="""
أنت مساعد زراعي محترف ومتخصص في تشخيص أمراض النباتات وتقديم حلول فعالة لعلاجها والوقاية منها.

المستخدم قام برفع صورة لنبتة، وبعد الفحص، تم تشخيص المرض على أنه: {disease_name}.

 يرجى تزويد المستخدم بجميع المعلومات التي يحتاجها فورًا، دون الحاجة لطلب أي تفاصيل إضافية أو توجيه أسئلة أخرى له او تطلب منه ان يسالك في اي شيء او اساله اخري.

زود المستخدم بما يلي، بأسلوب بسيط وواضح:

1. شرح مبسط لماهية هذا المرض، وكيف يؤثر على النباتات بشكل عام.
2. خطوات عملية ومحددة لعلاج المرض بطريقة فعالة.
3. نصائح واضحة للوقاية من الإصابة بهذا المرض مستقبلًا.
4. إن أمكن، قدّم خيارات علاج عضوية أو صديقة للبيئة، مناسبة للاستخدام المنزلي.

استخدم أسلوبًا ودودًا ومطمئنًا، وابتعد عن المصطلحات المعقدة. ركّز على تقديم تعليمات سهلة يمكن لأي شخص اتباعها، حتى لو لم يكن لديه خبرة زراعية مسبقة.
"""
)


#History messages parsing
def parse_memory_string(history_str: str):
    messages = []
    lines = history_str.strip().splitlines()
    current_role = None
    current_content = []
    role_map = {
        "Human": HumanMessage,
        "AI": AIMessage,
        "System": SystemMessage
    }
    for line in lines:
        if any(line.startswith(role + ":") for role in role_map):
            if current_role and current_content:
                content = "\n".join(current_content).strip()
                messages.append(role_map[current_role](content=content))
            role, content_start = line.split(":", 1)
            current_role = role.strip()
            current_content = [content_start.strip()]
        else:
            current_content.append(line)
    if current_role and current_content:
        content = "\n".join(current_content).strip()
        messages.append(role_map[current_role](content=content))
    return messages

#Summarize memory history after 20 messages (10 requests) and keep the last 6 messages
def summarize_memory_if_needed(memory, max_messages=20, num_recent=6):
    messages = memory.chat_memory.messages
    if len(messages) > max_messages: 
        recent_messages = messages[-num_recent:]
        old_messages = messages[:-num_recent]
        old_text = "\n".join([f"{msg.type.upper()}: {msg.content}" for msg in old_messages])
        summary_prompt = f"""لخص الحوار التالي بشكل مختصر وواضح مع الحفاظ على أهم المعلومات:\n\n{old_text}"""
        try:
            response = llm.invoke(summary_prompt)
            summary = response.content
        except Exception as e:
            print("There is a problem in summarization: ", e)
            return  
        summary_message = SystemMessage(content=summary)
        memory.chat_memory.messages = [summary_message] + recent_messages
    return memory

#Base Models
class Message(BaseModel):
    user_input: str

class Disease(BaseModel):
    disease_name: str

#LLM chains
chain_template= LLMChain(llm=llm, prompt=soil_analysis_prompt, memory=None, verbose=True)
advice_chain= LLMChain(llm=llm , prompt=plant_disease_prompt)

#Work on the endpoints
app= FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.post('/add-disease-to-land/{user_id}/{land_id}')
def add_disease_to_land(user_id: int, land_id: int , disease: Disease):
    try:
        insert_disease(land_id,user_id,disease.disease_name)
    except :
        return {"error": "User or Land not found."}
    return {"message": f"Disease '{disease.disease_name}' added to land '{land_id}'."}

#Chat Enpoint
@app.post('/start-chat/{user_id}/{land_id}')
def start_chat(user_id: int, land_id: int, message: Message):

    soil_data= get_soil_data(land_id , user_id)
    history= get_conversation_history(user_id , land_id) 
    memory= ConversationBufferMemory(memory_key="history", input_key="input", return_messages=True)

    if history:
        messages = parse_memory_string(history)
        memory.chat_memory.messages = messages

    inputs= {
        "history": memory.buffer,
        "input": message.user_input,
        **soil_data
    }

    chain = chain_template.copy()
    chain.memory= memory

    llm_response= chain.run(inputs)
    formatted_response = llm_response.replace("\n", "<br>").replace("**", "<b>").replace("<b>", "</b>", 1)
    memory= summarize_memory_if_needed(memory)
    history= memory.buffer_as_str
    upsert_conversation_history(user_id , land_id, history)

    return {"Response": formatted_response}


#Disease Advice Endpoint
@app.post('/give-me-advice')
def give_me_advice( disease: Disease):

    input= {"disease_name": disease.disease_name}
    llm_response= advice_chain.run(input)
    formatted_response = llm_response.replace("\n", "<br>").replace("**", "<b>").replace("<b>", "</b>", 1)

    return {"Response": formatted_response}

class Plant(BaseModel):
    soil_moisture:float
    nitrogen_level:float

@app.post("/plant-status")
def expert_model(plant:Plant):
    if plant.soil_moisture <= 20.0:
        return {"Response":"High Stress"}
    elif plant.nitrogen_level <= 15.0:
        return {"Response":"High Stress"}
    elif 20 < plant.soil_moisture <= 30.0:
        return {"Response":"Moderate Stress"}
    elif 15 < plant.nitrogen_level <= 20.0:
        return {"Response":"Moderate Stress"}
    else:
        return {"Response":"Healthy"}
