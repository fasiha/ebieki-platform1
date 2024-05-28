import json
import numpy as np
import sys
from sentence_transformers import SentenceTransformer, util  # type: ignore


def hasJmdict(item):
    return 'id' in item['glossObj']


def getJmdict(item):
    return item['glossObj']['id']


if __name__ == '__main__':
    if len(sys.argv) < 1:
        print('need input-output JSON')
        sys.exit(1)

    INPUT_OUTPUT_FILE = sys.argv[1]

    with open(INPUT_OUTPUT_FILE, 'r') as fid:
        data = json.load(fid)

    # TODO cache these
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode([p['glossStr'] for p in data],
                              convert_to_tensor=True,
                              batch_size=64)

    scores = np.array(util.cos_sim(embeddings, embeddings).cpu())

    idxNoClosest = [
        i for i, x in enumerate(data) if len(x.get('closest', [])) == 0
    ]
    export = []
    for idx, item in enumerate(data):
        # can we skip this?
        if len(item.get('closest', [])) > 0:
            # we already have distances for this. See if one of the new
            # entries is more similar than its least-similar sibling
            currentMinDistance = min(x['distance'] for x in item['closest'])
            distancesToMissing = scores[idxNoClosest, idx]
            if all(d < currentMinDistance for d in distancesToMissing):
                continue

        closest = np.argsort(scores[:, idx])[::-1]
        topClose = []

        seenGlosses: set[str] = set([item['glossStr']])
        seenIds: set[str] = set([getJmdict(item)] if hasJmdict(item) else [])
        for thisIdx in closest:
            thisItem = data[thisIdx]

            seen = ((hasJmdict(thisItem) and getJmdict(thisItem) in seenIds)
                    or thisItem['glossStr'] in seenGlosses)

            seenGlosses.add(thisItem['glossStr'])
            if hasJmdict(thisItem):
                seenIds.add(getJmdict(thisItem))

            if seen:
                continue

            topClose.append(
                dict(kanji=data[thisIdx]["card"]["kanji"],
                     distance=round(float(scores[thisIdx, idx]), 3)))

            if len(topClose) == 5: break
        item['closest'] = topClose
        export.append(item)

    with open(INPUT_OUTPUT_FILE, 'w') as fid:
        json.dump(export, fid, indent=1, ensure_ascii=False)
