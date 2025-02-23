import random

# Rarity Common, Uncommon, Rare, Epic, Legendary
def scoreAlgorithm(new_plant, plant_rarity, multiplier):
    plant_score = 0
    rarity = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
    scores = [1000, 1500, 2000, 3500, 5000]

    for i in range(5):
        if (plant_rarity == rarity[i]):
            plant_score = scores[i]
    if new_plant:
        multiplier*=2

    return plant_score * multiplier

def getRandomRarity():
    rand = int(5*random.random())
    rarity = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
    return rarity[rand]



def getMultDict(num):
    multList = [1,2,3,4,5]
    index = int(num/2000)
    if index > 5:
        index = 5
    return multList[index]

