from g4f.client import Client

client = Client()
response = client.chat.completions.create(
    model="gpt-4o-mini",  # You can also try "gpt-4.1", "deepseek-v3", etc.
    messages=[{"role": "user", "content": "Hello, how are you?"}],
    web_search=False
)

print(response.choices[0].message.content)
