# Rarity Common, Uncommon, Rare, Epic, Legendary
def scoreAlgorithm(new_plant, plant_rarity, multiplier):
    plant_score = 0
    rarity = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]
    scores = [1000, 1500, 2000, 3500, 5000]

    for i in range(5):
        if (plant_rarity == rarity[i]):
            plant_score = scores[i]

    return plant_score * multiplier    

