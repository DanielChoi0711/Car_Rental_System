document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById("searchBox");
  const suggestionList = document.getElementById("suggestionList");

  let carBrands = [];

  // 🚗 1. 서버에서 자동차 목록 불러오기
  fetch('/api/cars')
    .then(res => res.json())
    .then(data => {
      const seen = new Set();
      carBrands = data
        .map(car => car.brand)
        .filter(brand => {
          const lower = brand.toLowerCase();
          if (seen.has(lower)) return false;
          seen.add(lower);
          return true;
        });
    })
    .catch(err => {
      console.error("자동차 브랜드 로딩 실패:", err);
    });

  // 🔍 2. 입력 이벤트 감지
  searchBox.addEventListener("input", () => {
    const input = searchBox.value.toLowerCase();
    suggestionList.innerHTML = "";

    if (input.length === 0) return;

    const filtered = carBrands.filter(brand =>
      brand.toLowerCase().startsWith(input)  // ✅ 여기만 바꿨음
    );

    filtered.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.addEventListener("click", () => {
        searchBox.value = item;
        suggestionList.innerHTML = "";
      });
      suggestionList.appendChild(li);
    });
  });
});