document.addEventListener('DOMContentLoaded', function() {
    const specialCard = document.getElementById('special-card');
    const cardImage = document.getElementById('card-image');
    
    let isSelected = false;
    
    // Inicialmente, a imagem está em preto e branco
    cardImage.classList.add('bw-image');
    
    specialCard.addEventListener('click', function() {
        isSelected = !isSelected;
        
        if (isSelected) {
            // Quando selecionado, remove o preto e branco
            cardImage.classList.add('selected');
            cardImage.classList.remove('bw-image');
        } else {
            // Quando não selecionado, volta ao preto e branco
            cardImage.classList.remove('selected');
            cardImage.classList.add('bw-image');
        }
    });
});
