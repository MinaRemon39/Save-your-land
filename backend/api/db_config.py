import psycopg2
from datetime import datetime, timezone



def get_connection():
    conn= psycopg2.connect('postgres://avnadmin:AVNS_VUjKvYTpHnw8gx1nVyv@union-team2000-ai-c1c7.l.aivencloud.com:13148/defaultdb?sslmode=require')
    return conn



def get_soil_data(id: int, user_id: int):
    query = """
        SELECT
            "soilPH" AS soil_ph,
            "soilMoisture" AS soil_moisture,
            "soilAir" AS soil_air,
            "soilTemp" AS soil_temp,
            "organicMatter" AS organic_matter,
            "ambientTemp" AS ambient_temp,
            "humidity",
            "lightIntensity" AS light_intensity,
            "nitrogenLevel" AS nitrogen_level,
            "potassiumLevel" AS potassium_level,
            "phosphorusLevel" AS phosphorus_level,
            "chlorophyllContent" AS chlorophyll_content,
            "electrochemicalSignal" AS electrochemical_signal,
            "soilType" AS soil_type,
            "last_detected_disease" AS disease,
            "plant_status",
            "plantType" AS plant_type
        FROM api_land
        WHERE id = %s AND user_id = %s
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (id, user_id))
                row = cur.fetchone()
                if not row:
                    return None
                colnames = [desc[0] for desc in cur.description]
                return dict(zip(colnames, row))
    except Exception as e:
        print(f"Error getting soil data: {e}")
        return None

def insert_disease(land_id: int, user_id: int,disesase:str):
    query = """
        UPDATE api_land
        SET last_detected_disease = %s
        WHERE id = %s AND user_id = %s
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("Select * from api_land where id=%s and user_id= %s",(land_id, user_id))
                row = cur.fetchone()
                if not row:
                    raise Exception("Can't find land")
                cur.execute(query, (disesase, land_id,user_id))
    except Exception as e:
        print(f"Error getting soil data: {e}")
        return None



def get_conversation_history(user_id: int, land_id: int):
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT "history" FROM api_conversationhistory
                    WHERE user_id = %s AND land_id = %s
                """, (user_id, land_id))
                result = cur.fetchone()
                return result[0] if result else None
    except Exception as e:
        print(f"Error fetching conversation history: {e}")
        return None




def upsert_conversation_history(user_id: int, land_id: int, new_history: str):
    now = datetime.now(timezone.utc)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT "history" FROM api_conversationhistory
                    WHERE user_id = %s AND land_id = %s
                """, (user_id, land_id))

                if cur.fetchone():
                    cur.execute("""
                        UPDATE api_conversationhistory
                        SET history = %s, updated_at = %s
                        WHERE user_id = %s AND land_id = %s
                    """, (new_history, now, user_id, land_id))
                else:
                    cur.execute("""
                        INSERT INTO api_conversationhistory (history, updated_at, user_id, land_id)
                        VALUES (%s, %s, %s, %s)
                    """, (new_history, now, user_id, land_id))
            conn.commit()
    except Exception as e:
        print(f"Error updating conversation history: {e}")
