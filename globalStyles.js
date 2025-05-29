// globalStyles.js
import { StyleSheet } from 'react-native';

// Your custom colors
export const colors = {
  deepBrown: '#482f1d',
  clayRed: '#90543d',
  goldenSage: '#a4976b',
  cream: '#f1daad',
  walnut: '#8a5e2d',
  earthyGreen: '#8d8f6e',
  rosyPink: '#f5b7ba',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },

  text: {
    fontFamily: 'Pixelify',
    color: colors.deepBrown,
    fontSize: 16,
  },

  title: {
    fontFamily: 'Pixelify',
    fontSize: 24,
    color: '#482f1d',
    textAlign: 'center',
  },
  headerButton: {
    fontFamily: 'Pixelify',
    fontSize: 16,
    color: '#90543d',
  },
  input: {
    backgroundColor: '#f0f0f0', // light gray background
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 10,
  fontSize: 16,
  fontFamily: 'Pixelify',
  marginBottom: 10,
  marginTop: 10,
  },
  subtitle: {
    fontFamily: 'Pixelify',
    fontSize: 18,
    color: colors.khakiGold,
  },

  button: {
    backgroundColor: colors.clayRed,
    padding: 12,
    borderRadius: 8,
  },

  buttonText: {
    fontFamily: 'Pixelify',
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },

  section: {
    backgroundColor: colors.earthyGreen,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  highlight: {
    backgroundColor: colors.blushPink,
    padding: 4,
    borderRadius: 4,
  },
  // MapScreen
  pixelText: {
    fontFamily: 'Pixelify',
    color: colors.earthyGreen,
  },
  pixelHeading: {
    fontFamily: 'Pixelify',
    color: colors.clayRed,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    fontFamily: 'Pixelify',
    color: 'white',
    fontSize: 16,
  },
  loadMoreButton: {
    backgroundColor: colors.clayRed,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 4,
  },
  zoomButton: {
    backgroundColor: colors.earthyGreen,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    elevation: 4,
    marginBottom: 10,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Pixelify',
    color: colors.cream,
  },
  calloutTitle: {
    fontFamily: 'Pixelify',
    fontSize: 16,
    color: colors.clayRed,
    fontWeight: 'bold',
  },
  calloutAddress: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pixelify',
  },
 calloutArrow: {
  width: 15,
  height: 15,
  marginTop: 8,
  alignSelf: 'flex-end',
},

// Cafe Details
container: {
  flex: 1,
  padding: 15,
  backgroundColor: '#fff',
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: colors.deepBrown,
  fontFamily: 'Pixelify',
},
address: {
  marginBottom: 20,
  color: colors.walnut,
  fontFamily: 'Pixelify',
},
cafeImage: {
  width: '100%',
  height: 200,
  borderRadius: 10,
  marginBottom: 15,
},
sectionTitle: {
  fontSize: 18,
  marginVertical: 10,
  fontWeight: '600',
  fontFamily: 'Pixelify',
},
review: {
  marginBottom: 10,
  paddingBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
reviewUsername: {
  fontWeight: '100',
  marginBottom: 4,
  color: '#555',
  fontFamily: 'Pixelify',
  fontSize: '16',
  color: colors.clayRed

},
reviewRating: {
  fontWeight: 'bold',
  fontFamily: 'Pixelify',
},
reviewDate: {
  fontSize: 10,
  color: colors.clayRed,
  marginTop: 4,
  fontFamily: 'Pixelify',
},
ratingText: {
  fontSize: 14,
  color: '#333',
  marginTop: 2,
  fontFamily: 'Pixelify',
},
keywordCloud: {
  marginVertical: 15,
},
keywordList: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},
keyword: {
  backgroundColor: '#eee',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
  marginRight: 8,
  marginBottom: 8,
  fontSize: 14,
  fontFamily: 'Pixelify',
},

//ReviewForm
reviewFormContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  reviewFormLabel: {
    marginBottom: 5,
    fontWeight: '600',
    fontFamily: 'Pixelify',
    fontSize: 14,
  },
  reviewFormInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 10,
    borderRadius: 8,
    fontFamily: 'Pixelify',
    fontSize: 14,
    backgroundColor: '#fff',
  },
  pinkButton: {
    backgroundColor: '#ffb6c1', // rosy pink
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  pinkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Pixelify',
    fontSize: 16,
  },
});
