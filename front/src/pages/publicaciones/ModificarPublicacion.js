import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useState, useEffect, useRef } from 'react';
import { CiTrash } from 'react-icons/ci';
import { FaArrowRight,FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import "../../HarryStyles/Intercambios.css";
import "../../HarryStyles/estilos.css";
import "../../HarryStyles/Publicaciones.css";

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};

const ModificarPublicacion = () => {
  const hasMounted = useRef(false);

  const {id} = useParams();

  const [myError, setMyError] = useState(false);
  const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');
  const [nombre, setNombre] = useState('nombre'); // aca va nombre actual y si se cambia algo se modifica de aca
  const [descripcion, setDescripcion] = useState('jiji'); // lo mismo q arriba
  const [centrosActuales, setCentrosActuales] = useState([]); // centros actuales
  const [centros, setCentros] = useState([]);
  const [imagenesActual, setImagenesActual] = useState([{id:0,archivo:'na'}]);
  const [imgActual, setImgActual] = useState(0);

  useEffect(() => {
    // aca fetcheo todo
    if (!hasMounted.current){
      setImgActual(0);
      setCentrosActuales([{id:1,nombre:'uno'},{id:2,nombre:'dos'}]);
      setImagenesActual([{archivo:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAHdElNRQfoBhIAACaRntwGAAAa1UlEQVR42u1dW6ykx1H+qv45s2ev3rUdLrlYyDcJHK9fIpEFP0TIjnJRQLFEeAERIgIBFCGRBCITQZ4B5QEhRRChkKdIUaQ4oCg4uxsQIgIipAibF7CDYsML8WXP+rKXc+av4qFv1f13//PPnDlnvcSllT2np6cvVd1V1VXV1fR7f/1ZtIE0fWYFgGe/90z87OtAANxz950gcSUSfgHg6aefjp8FUIIQAzh1+pZqj6dPn672rgShSn07EguXL1+utvPSiy+ZkbsWBCT33nUnSFxNdV8oA3jKjF/JTYEBnDpzOta0A7vllvq8WsAr1X4dNg6vE+AGwxgBhvzH/jevI5H/LO9Sy8YPFIaz8OWDkmlYqmBsWiN1mI2Pmxs08LMiAVW6D2O0JHGfmRRKUtBAqex3/zCOd1u+rEcGvDzwv9dEgygzltKgVWEqCxrtYOrabzV4aLthDCbv4AkIWQFmUyr5lTI+/lxjMRAnxm6S5FeQ2wcMQGh9GgxVIzaazLRmOQzSDDUbPwfysMWD66gYgCWMjKMMQIsANOD4NPh22N9SXLFyHBMB03/a0kHHIeeiEvAq2cgpol7I4TpOMP1cohrdGZ7jhsTq1ev1YNZaI//zzLPFHNyqOPeTby9GzyoAvv/i9y2u46d77747L/WL6z+f/i+PhwK5XJnKSth3Y3tp53IcG5kh3Xv3XVV6uNPMcD09+PZzAFgdAdh97gn/8O1v9VHWNYYXKYRwPhhiu74D9q2ocFswyFDwxNW0H7yPgpgPAoSFr6GcBMpVsWRR0cXlyCUbSDtb025ozcvCrMVDhlpQGqvpOM6HjW4gEHdczCcP9hpFGtZwrPYsWmWyBRQDJEAIrNBMrnAYSUH7UB4GH7oSgN3uERJWVvKSgIQlYCCjwQB1mKgdjX3X6MCUp9VE6v9NAVbf4LriZE1IXWTrnQlgjdqBm29aN5LkBJQdVcAbUuSaLIjtEAOKgcpZzH0VSyyj99YVv9+TQu0XOCC+WQagvlm/S6bC4AzhmYZw2qzKnGQvhxlxOkWC/RTCt37zJRqklpOlKG1fQbB02V07hSpNNXSN9TiFYwRMseWVBwXqtMag7xJakslPVhl+LfgFNH5KomIfrzWdugwg225FxzLToKTVuS3Mij7W17yycpqUX2sbwvUIqOmRisKk3bMk1DuNCMpu4vFIISRQt7GCzChEsfmM/ZwDCjAqgWQES8zRcE/FliSLNIOHK0mALTF0NWL5yGLq0FHTvuNQj/TuT3b8JJTzrI+ruxx22pRWGDiub6esDAgb0e31XPWCYSXlbfa9Z54pihyKf+rtP82auKHDGymee+65iHoNsoEVj33lMRYmePlW1SpjDwaFXKAy+A9KOHPm1ioBLu1cGg4ewFve8pZUQuIUMCJ66tvfISIARBqRJeTPenZ1ua8eeeQRg1DH6xnAuXPn4vhjBSH84798a+gkAMBEqC2scgcUJ4ClBwKHfTZs1O2AgQqI0cNBgnlfLz/SKN9ejLfjuaLTiolA6o96ROxYjRJ6dxjkSINsy7YWtcVSlNKrHowrMqA4AZTYJ6MaNOXHuPS6EU4IDRSA+5e4P9x+dbYRkmAjCcslaU2RDKJgUndWyBQkb9SKJoqGncqWt2RAWDiw56mh0cpMT702vQz165hO7ajqmF1SeViHI7+J2CCAhYVAYGvtKTvMtSlXTQ1+V4JZez3m+rjlg2ETqEGBP8sEacY1vAgNzqLDaiMIrX/VqK+d+aMP0yFWIg6iNqxHBlQBhbA4hDqBPERoi7dQQIgSa0DN8OfLZUDTAjGcICDk96DjfZ2wU0ZL7MddrLyq2X0CYab8tgNFFEXI/CokYBYWFoAISoB6q4N4tdQ75bGMh1Zp1Dr3VKyh4azrzAxxJ3rmo8SBkzDUHSIhxJ3wltfwmLRQb8JmIlkLj0uYycivjO2BWEGsDrusIA42fvV25nic6tywSRbEQtjr0IJk1Ap/kqIzuF7TGBd9AKySl3PXz5wGLYQuYHNL0Al3ElR+i+VooiDulLFsDXUya5Rzo7wxsbzcC19lBhGIFI7ZIximhICeQdK5ITpu2UknYbXl/LMqzVgxE0Q5LuSJMUIG+uK/fbNKgFdefRWo2Hw+/9k/79SoBwArk+In7vlxjyPlAlVpk6lVSZdDJu4avOuNb3xTtfzUqVPV8u2j29XyN7/pzQgLHwAgQlCSP/7MnwhJIXgXjA/9xq/3yeKbUHzi+PEC3U7NffzvzlfJUFluIwKAFZ2Ehe8Qrc6MxZ141k/5UjVODw5fLQkyMEO3qlchP/znWWO0tjzNXJkbO8nLraj5hMUb+Gp22iIVFu47+/MmAp1QaUGFAFHbLRGkAX3hWJ8+OBUlECNrbqj5rAyl1T5rsyVUdBTRzfLAbZSFxBkNAVay/tRyRtNtD+0IkjWRkpW0tM/NwwH0Ep0ZnM63dr9mPU73UVtPWZW1zNr2rMEkSYwWN0Ufcz8a1rFGoaVaaXQ/5ZEKy2mQGdrqY2vF6ggD7kwQsS/D0TZoYAWDGJdfMuoJ+krtGwFTsX8zgjPwwdCpvgOGRbqPKJ3XYYQ11aO7V2y/Vd9HG2wujuEHBWaPX7hg/nSxMcyKdz70EIAC450g53E+/sCqBZKbUB588Nyg043wvRp3Cs5nVRV1DlwjCUzEEQ0UQ1/CzmrvoolIjdtD8oPIiRPH92pxQRcvnrf1ogy4/+z9VdFdP3YKlXhsomFatU3DEtlARJ1H8frEHsH+xJFZg0TLijfmkrxByL0poYXfauSoLTwwbvD/C0bONyOru1XfwkzzzTVB/ynR7a1y3grNgzo8+O06BKMGCg46toV8IJM7CdtorZU1DjExFlXs+K9tvVX64Bt9qtgYWE+4es9Hct9PBCtyherYBzAbMiklkeAnAiRbzAQhtM3jNz0kPzuAGLRunJYaIq01x2ZyDIQDr9hCytq3PyyFcNQsi8+bBeGF8jUZmClIGLoNTaNiH5Ys837hTfyGDyyIdzu2ZmEHWyJHF7tzyczmAHY7vjqb7/EEC4omz5YaAtSnYylhCqegbnb/A2ft3zHW7hsXLgzlwdaGxK3ytcf/+Ut9d8Xe/mAF9cfe8eAHuD8RUS8+0ku+9vnPbfeLfI641s3f86EP911pGT262H32b//m9PVrZk4AsDPfvuPd79ubb2Pf8PjFC3vWUhxwffaB+5P2aepfeulytZ3BDgA4NHdwNgkh6bsr/daOBBshA6Juj4u3exkluFPZ7ndPLHaHTXVaWRRzkdPXr9127Urlq37zOptd6asyjNIaShrsfiSG/wQHLwDIIMJyZfAhfDnDxaFEqK8KFW2nIlGlyoXgrKGDONQCFRlEIYODN+xwiKpD21y+aVjhPvP48hoGMYYOTJ0pMqCmBSXOsy4NJki5UM9yucOywi6lQetGTd7KPjhPhLoWdDhgsc+Tb9cc1GA4+IIT0NpB2tNhUnj6gUw4yIDXCN8P9lF74Yb4gJkwWgRQOmC3jDL1x+L2Ts5YOUYhLsgSpie+1s2HzVzr5sNDAIBd5p0jFV1z58j2qcYhoEqAVjTDeveWqzCzeXVS14qzZ88iaT/+//Me3/jSV9JpIJR3MnvrXfebBgomO3Cl6vY7HvxAcWeaAegM/XYMNg236bHH/N5f+fBMpWhwQbxbQ+jV2fzH3vW+mZSh66d59uqsQsjB/FMw0lPffXphgoVc4YLx/g/94vVkEki+30s5PgeHuFL8HAILqkk8nbnTliWAH6dWnOk98bXOINpoMlqTk3vMl+dzoIJrRWsHsP8eMY5HiCatc6XVyi0cqgzIYjSK+d9oSeBxnTO0afjfFzQJUJUBuqLte+rkbzT2kQhgJUFHjUPDGrboFlQIYNEREynsAyxLSY77ZkzOa4AYE88B1bW46gJduYPXYbNQjwuqfgaaXoWVSPXaWONTgYg4ZQnybGqDsmFlIbwR3jeXxcnd3flATdzl2ctb27tdOapOZd5LXQ3tZsOjQIfdub6yNWh/j2e7dKLHBE00ABHTwBh3GATYyfRZP8MjC9x65tb5ILKx61cj5MndXf3Xfzp5vTQXP3/k2Mm3nXuhO1aUB39AaY4u/QEB5nLlpaf+/qjsFOVX+fSpe37mKq9EAH+t2P3hyphweefy9TRpmzpgJUzcIFPEXBYnr1/50VcrZ8CXpXLxt1PZ7hcn9oZfcdUfMMPutu4c1+8X5aqYoeJUGIEqAQ5jB2RsPTeO7lMG7ANugNOfmIgK9ZRocwNZuaUbFv1Ztc4rH8RdgcOElVlQ1W5M5b2BIVQSrKwOrSuS069OYpXwmbHrC1liiZvRHL0aaLgFdWBQ8wdAqFMhZYHapBmqm/Mr3yQEABor96aPBtsPAdJNaB/C1fSmlQtmt+Pnjxwb1nv+yDHiypB6xrWugutrHfcsQ3/3ArMrfHrYzhU+PW+lSqXKDmAS1d4v+HRDS3VzZ8n2OWBnJ/1h/AGXXrg0T9ogx8wQP/KmH45JCkwuNlT84Movb22ffNu5l2VRcBXqZi9vzYfhpHuM9/zqL3W6KNrpmfeisd4gZZePnb7nHTMt1dY5za7jqGo8yJhsBZ4Ane2XiECSOQMCXL58ebcWInjL6ZObIcAUGMnLYZBa4Ze7PHthe1agoNUJID27NGiDC8bF3VIHyj3mV2s7AIA21LiBbt8BQuxuemgxCzmEHfCaA5vxDebS8k0OqxGgmr5FUj5HERzQVWGT7gND7G+gx/Jw5W4p+S0gqWs36w3ugFZWJz8Mk8Y6lMSIWo4Z7ACWlDxXbDBw66bAmqANld/ktWrXRDkZCzTix+bBPf2NwX5YUHarPw7aJRHyc93AsXnDFFylu8O4+TONAClKwNKfLQ3Mfyt5ZskkouWMjSybZNbdsmp21U/aDQUMtZ3m8BqZIVeGMQJUEzsvGNyZwbk0ZQIhAYOFac2sTNUR+Plv9XK03x0GNu92fLWb73X7706UxOSl8oU9o+8We1ywHemZhSo37taA2c6lnWEpAzs7l1MyypAgkYGPPvrxmCPJpathxUz46196zKUsc2aDSDyXt8cPUtPZ7fY33IrJcLTfffbrXwvx/gl2jmzf8e737nUhBmvCqr/rrnssKsP08Mk/fLTIDwpgr1v81qO/vdctYjXfNvF/fPe/YR4XS93m98ginDl1S50ArTnb4VM67qJn9GxvUTnZKz1LJ+Fik0KJNxjrMO8PNt5fSIRCxmWDwZ5l0S32ZuWBTjCz6des0W7VnNiz9u4dZCnOzrcRYj4jRwMWAggsUAL5nCNQOEVeqL5n95O1Q+pDGkqFMM5G41IJXvNPhDT7TslQLKoCDabwqOYbMlni1iyBcXaJMKSFZyER9vIAgDBYUyo7Dhn7dF+22ykwzDC1HJRETDji8j5ChtxhfnOb9dKWNAkwzih8CJvFeIb98Nnd6g83Ot3u8Xf8AIo3B2PJCNaWorXy1UguUkZ7DWa7gWo7YFQLQqNepEGkzVgWuJHWSSco3ik9pSD+83OToQvTl7y2btdbc5v94Mon0WDtWJvRN2SKFFk0sAGE3FpOiKUrxMkuBpcLNd41Iz3UOyBp8PHTIKVh+FpQc9vVb440cn2uoZK2tKDChpy1PORFCMkZ0QmHlDYUGKV57lDW0452ebZzZHu4X3eOzE/x+od5TWql1+783AP07vHduv1DQAuGz2afoS7VmUCA/H6ARJzee+89FteRALffdnu6WCGMcNPoZ9///rAE4oh5q8dXv/xYzLnqTgkuAP13P/6J+GIMGRffiy9cGo7y6mx+x7t+bqhxnur46mxWFbZ33mneLzOL6fc/9amsnATAXrd4zy88cn3mN0HKfQTcfvsb2mqby2fD4W8WwlPffTr+aSnRCmWp547OaJ2fuUfI2vv8+8E/FcwPXSPKdTov2mNu365eW5ok1q+EvQ4LduqB2DsKQjW1ihZuBxh7TByHIyHLstheT4Ac425Fh30QFYNhHsV80YWw9dw1SM44LeLe/FBvpzvMnHQ1NlqkVpPiKJulik3Jm43lysxdB0Ilva8a8Lb6OaCd49y+NtRCYngBBwCzioQEuD2BVMDukgo3yHCIDhaSJHgp6jwZPyx/EfKnwIhc95qdEDNEok48SNKcnvkq8gXV/CdpBDxIZ2rTD+fvYbpSgc82C1ZhsLDsgRnilFq/Lf3rShwyIwx8jStAvX7k+3bh28t1ihjo5rFPwfkehFOdEhSIwJp68cnXKZjCXBeUXowr8rAkAozNTNe5wE7qyOBcY6KAsECYfW4/cTxSCAwBQYIkPwiIBs485j5FWTs5rCScYR9Lb2dEFIWOhFy+Q6SXfUgr+mphLJqN3VTJs9w0QRnellv4I43HhgXqHsNMtiO3yphBwpHRWo1l0Fp9pDm6LfaTjDWGTAm9BWGQ7DmCfLVijNP6fTBMtpHeoKHldpfaQYzCuzb5A6PFbFu4UPJ5T9wke4K7aaXC0oFVoOgkOZCFPA2wD4VmADLAvgBQluuzhWZWTwFkwSIh6iJnueESbGF4cIcDmrn65p0XjimKKT5LMArF+wEJA1deebmOY13Ccwt47vn/ZatEKQPY6vnrX/7qVt95bhvFBvCx3/kEcjq7r1584YVq+3fccUeGl8BhPv3pPxBy+UpS3sm9Tt7z84/sdWamgQy3/dAb1OUfN50OThjR7oIotCXbBHzsxMkwmGSLBHD+m+fNOFOLtfcDDKKlYp9qgVHOjGtJo53dKwnitCOlTP9zD61JUFInMeAcilR3Eftu+bv/KsleJ7vmdQ0neJ1qlrAvSzonhcYTcs7rrS3a0WBoH7VQEMDzAZPCvURuRUP1fq5EMPfGVqY1Z4Z1ieYjELur0z1Jp1AXXeGQGFhBzjEGeI9JyZUDuqEmbbnzLEaOL8a+Zq2NKf1vvuqzd5JrN+bCzwvypHI1ZptK0r76rCZnzl3P/SssSujZn/hE/TsoHDY1Z2ayaa86kVgW5FhEsBL6N0jSK6MkBvuJAUZmuBHwa39gu7Nmu5kOVnd8P8DQYNzXWiYXyJaG6VyNl0rCVTenbgnABIkveYW+OJBBwFbny1BvKBtYkFN1nALq5LDfAa33EmxU69TrA2ayWmszfw0utS/oW8eCzcJotiNnwAi7TSlhp5WAqgpx5vWfBwm8wbvtI2NoAbU38YG8H5C9x2LHkQs3f3TwT5SiA0DeXxZe0vG7gdPpIRunq4NR7mxx1HwuZD1GugmKHlxw7pK1644LnMjQ73XovAMnJUoKbND515ajKewn2WOn+ENgHpj2b8V4yR+xfwNDfOmXP/NoUeQ8zuH9AF8Swb0vFidTxbh5jQtqQrm9s0YYwKkTp+Ij3NE+RMDHfu2jRXZSR4+/+ssvOGQBpnHCBz/4wYj6cOySnvGZz/1ZT0b7EhVZ9NA97UVVelFVuwXzrVBJmYN8yR8/cTwW2vLzFy8a7CZl7D73fsCAAPvWgupknXSkdUFE0cTYszshVw4BWmOMFVczpT/78AQhhwxA7oE7UmZRKETV7z+dOuBVYb/5gtamgeX1al8MGhxwUobq8K6gkCiblKLqXthkNA5nYnZD/FMHapJGG0kOycA+eabT34mcAhvkfis1xXYaJju2j1Az34pg+QrNsM8HspwLaD81XPks7d1Qy5xLmfegdPY3FQa7Qlsx5ca7pOXuijZ0MQ+P+yH5XLvBzh78UxKnSuaz/1l+qYggykqq6CV/Pr75bloN0UM8SrZcMvLLoJFhRHjJgrwpxmRNPKAoEhvC7rvOh5G4EAE165DFePHZ4ldo0Pq6MMLThxtCpvGoscy5MbTfPkUWbS+cexuGvuUASQYM9cjsNRX1thqiZIogSc6G7JoCUonlPNEzHhemGz+FVZ/dcK+MdgnShSqfM3o3ft4qb74fEBd+K5PxpnaGnQYreoYS+thyJ6zcCfbc074mkidamJ3ij6QLiYvPCFqmr68EDRZKNSjL7M/Thmp98SPP90zJpkh/dPGLwxqkePLJJ4fPm7PioYcfip9tuT0fWDhx4ujAtMAALpx375dx8TTIAw+8FeV64a2ev/Cnf7El5mnx4Gb5yG9+JNg4kyhWwneeeMJezomjffjhdL6xiZOvvPLqMNIWwInjxy1Oo7574cJFsxRS/bc+cF8+WQ9T3w+wI4jywMpkKxtQs74VUDXsFO+r+EJACO5VhGxWCkB69g/KhpXlmYyrL5xWpSu3UW+Wi1afkJqiNhXvwGwqQ0/zlmTkRaQF55GqWjNCj/wCSYEIm2G/Mgzzc6k7WIsIZxTt7/cVlqVa0LCaNOpPcciUjVbjqIq5FXdRy0baox+Rb+3GGIBTkVhd7KZZ+41mV5JVE59ks+VrYx/AbLj/ooGbpo5+EDFH4+cA+zcD4VJHRVcMcRWpLbH1RKFA5uONSlH4k/IV04JwJq8j2ub8NRIo+6p5ClvjhkxEB+UWm01BVUNo9FAeAAwSex4swNYspg9spVnsHyaZo+PqqJS3X9woDlbDcQ+uhY4C9VNr3lQw1R8guVJhyx0NioW26oYZp1bUdgroGdPfOUU4MVH726WF+0mUXgX65Fc/WxS5PX7LLWeKEgf//sSTRbmjx8MPP5y7f/2H8+fPDwsB3PfAfUrxdkOym+9cvlz1W9128kzJBklc/Srilo4/u4UIvPOhh7mma3zj4uNVRBf2fTv+laiySY9YYcMYfmvn1hJZw+Xvdpg17g/RtAYM9YuWxrEUjwf+hkxmC8o/L9Wy29wfiLG60zC2/ixfw7CaP2Boilp1AR5odMIGIcqe6vKSDZ6ER/qOsNlYJdTOTfvhJFXIchYt28E0OPO38F50yvvemBuTAVV2VDXe2snsE/tTYNyam1l/a5OyAz6IcY4QoE7aYmXFNVV1+ReWwuH6WjW1xch4Dmr8jZ+3Fv7Kj3nuc+Y2dnNcCxqxj693xXmfMLT1rj3+/UDlHDAOp41+DWNtf+LJJ6shNGfvv9+WGH35UrX9NSY5dOoVw7Nw5tSZauXm+M+uZt/f5BsyU8Ay8arNXYzp6kAe595fmzKqJR8CTJQBvLR8ihZRg2mZ45D5DEoXcaxibJ+srXFm5WRkQHX8LRmwyhyXz38zoCtjf/Owsg2qhtApBp8NngOWr+6Dgcbd4OkoHPrRaPn4q1EgY52s7DVaHws/iHD4DoACftAJcMPhdQLcYPg/gdnmSB3QY3gAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjQtMDYtMThUMDA6MDA6MzQrMDA6MDBDlIkdAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI0LTA2LTE4VDAwOjAwOjM0KzAwOjAwMskxoQAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNC0wNi0xOFQwMDowMDozOCswMDowMKJ8egoAAAAASUVORK5CYII="},{archivo:"data:image/png;base64,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"}]);
      setCentros([{id:1,nombre:'sede algo'},{id:20,nombre:'sede pepe'}]);
      hasMounted.current = true;
    }
  },[]);

  const handleSubmit = (e) => {
    // aca actualizo
  }

  const handleCentrosChange = (e) => {
    let centrosAux = centrosActuales;
    centrosAux.push(JSON.parse(e.target.value));
    console.log(centrosAux);
    setCentrosActuales(centrosAux);
  }

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  }

  const handleDescripcionChange = (e) => {
    setDescripcion(e.target.value);
  }

  const borrarCentro = (e) => {
    e.preventDefault();
    console.log('INFO');
    console.log(e.currentTarget.id.split('-')[1]);
    let centroAux = centrosActuales.filter(centro => centro.id != (e.currentTarget.id.split('-')[1]));
    console.log('Centros actuales: '+centroAux.length);
    setCentrosActuales(centroAux);
  }

  const borrarImage = (e) => {
    e.preventDefault();
    //console.log(imagenesActual[imgActual].archivo);
    console.log('INFO');
    console.log('imgAct '+imgActual);
    console.log()
    let imgAux = imagenesActual.filter((_,index)=> index!=imgActual);
    setImgActual(0);
    console.log('Centros actuales: '+imgAux.length);
    setImagenesActual(imgAux);

    if(imgAux.length == 0){
      setMsgError('Necesitas al menos una foto para poder guardar los cambios');
      setMyError(true);
    }else{
      setMyError(false);
    }
  }

  const avanzarFoto = (e) => {
    e.preventDefault();
    if ((imgActual+1) < imagenesActual.length){
        setImgActual(imgActual+1);
    } else if ((imgActual+1) == imagenesActual.length){
        setImgActual(0)
    }
  }

  const retrocederFoto = (e) => {
    e.preventDefault();
    if ((imgActual-1) >= 0) {
        setImgActual(imgActual-1);
    } else if ((imgActual - 1) < 0){
        setImgActual(imagenesActual.length - 1)
    }
  }

  const handleFotosChange = async (e) => {
      if (e.target.files.length <= (10 - imagenesActual.length)){
          setMyError(false);
          const base64Array = imagenesActual;
          for (const file of e.target.files) {
              const base64 = await fileToBase64(file);
              base64Array.push({archivo:base64});
          }
          setImagenesActual(base64Array);
      }else{
          setMsgError('Solo puedes cargar hasta 10 imagenes');
          setMyError(true);
      }
  };

  return(
    <>
    <br/><br/><br/><br/><br/><br/><br/>
    <form onSubmit={handleSubmit}>
      <label style={{color:'grey',background:'#fdfd96'}}>Tenga en cuenta que los centros o imagenes que elimine no serán permanentes hasta que guarde los cambios</label>
      <label>Titulo</label>
      <input type="text" value={nombre} onChange={handleNombreChange} placeholder='Nombre de publicación' required/>
      <br /><br />
      <label>Descripción</label>
      <textarea value={descripcion} onChange={handleDescripcionChange} maxLength="255" placeholder='Descripción' required></textarea>
      <br /><br />
      {(centrosActuales.length > 0) && (
        <label>Centros Actuales</label>
      )}
      {(centrosActuales)&&centrosActuales.map(centro => (
          <>
          <div id={'div-centro-'+centro.id} style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <button onClick={borrarCentro} id={'centro-'+centro.id} className='botonCampanita'>
              <CiTrash size={32}/>
            </button>
            <label style={{"margin-left": "10px",display: "flex","align-items": "center"}}>{centro.nombre}</label>
          </div>
          <br/>
          </>
      ))}
      {(centrosActuales.length < 3 && centros.length > centrosActuales.length) && (
        <>
          <label>Puedes seleccionar {3 - centrosActuales.length} centro/s más</label>
          <select id="centros" onChange={handleCentrosChange}>
              <option value="">Seleccione un centro</option>
              {centros.map((centro) => (
                  (centrosActuales.filter(c => c.id != centro.id).length == centrosActuales.length) ? (
                  <option key={centro.id} value={JSON.stringify(centro)}>
                      {centro.nombre}
                  </option>
                  ) : <></>
              ))}
          </select>
          <br/>
          <br/>
        </>
      )}
      <label>Imagenes Actuales {(imagenesActual[1])&&'(use las flechas para avanzar y retroceder)'} </label>
      <img className="publicacion-img img" src={(imagenesActual[imgActual]) ? imagenesActual[imgActual].archivo : ''} alt="imagen no encontrada" />
      <div className="botones-imagenes">
        <button onClick={borrarImage} id={'image'} className='botonCampanita'>
          <CiTrash size={32}/>
        </button>
        {(imagenesActual[1])&&(
          <>
              <button className='botonCampanita' onClick={retrocederFoto}>
                  <FaArrowLeft size={32} className='botonCampanita' />
              </button>
              <button className='botonCampanita' onClick={avanzarFoto}>
                  <FaArrowRight size={32} className='botonCampanita' />
              </button>
          </>
        )}
      </div>
      {(imagenesActual.length < 10) && (
        <>
          <label>Puedes seleccionar {10 - imagenesActual.length} imagen/es más</label>
          <input type="file" accept="image/*" multiple required onChange={handleFotosChange} />
        </>
      )}
    </form>
    {myError &&
      <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
    }
    </>
  );
	/* const navigate = useNavigate(); 
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [centros, setCentros] = useState([]);

    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const handleNombreChange = (e) => {setNombre(e.target.value); setHuboCambio(true);}
    const handleDescripcionChange = (e) => {setDescripcion(e.target.value); setHuboCambio(true);}
    const handleCentrosChange = (e) => {setCentros(e.target.value); setHuboCambio(true);}

    useEffect(() => {
      const fetchData = async () => {
  
        try {
          const url = `http://localhost:8000/public/listarPublicacion?`; //Falta agregar el id de la publicación que queres traer!!! 
          const response = await axios.get(url);
  
          if (response.data.length === 0) {
           // setUsuario([]); 
          } else {
            const usuarioData = procesar(response.data)[0]; // Solo toma la primera publicacion
           // setUsuario([usuarioData]);
            setNombre(usuarioData.nombre);
            setDescripcion(usuarioData.descripcion);
            setCentros(usuarioData.centro);
          }
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchData();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
		  console.log('Submit button clicked!');

		
			console.log('entro');
			const formData = new FormData();
		//	formData.append('username', username);
      (nombre)&&(formData.append('setnombre', nombre));
			(descripcion)&&formData.append('setdescripcion', descripcion);
			(centros)&&formData.append('setdni', centros);

			try {
				setMyError(false);
                console.log(`nombre: ${formData.get('setnombre')}`);
                console.log(`descripcion: ${formData.get('setadescripcion')}`);

        if (huboCambio === true) {
          if (window.confirm('¿Seguro que deseas modificar los datos?')) {
          const response = await axios.put("http://localhost:8000/public/updateUsuario", formData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            });
          console.log('Success:', response);
          navigate("/");
          }
        } else {
          alert('No se realizo ningun cambio')
          navigate("/");
        }
			} catch (error) {
        console.log('entre por error')
				console.error('Error:', error.response.data.Mensaje);
				setMyError(true);
				setMsgError(error.response.data.Mensaje);
			}
    };
    function procesar(publicacion) {
      let publicacionCopy = [];
      Object.keys(publicacion).forEach(function (clave) {
        if (!isNaN(clave)) {
          publicacionCopy[clave] = publicacion[clave]
        }
      })
      console.log(publicacionCopy)
      return publicacionCopy
    }

    function procesarcen(centros) {
      let cenCopy = [];
      Object.keys(centros).forEach(function (clave) {
          if (!isNaN(clave)) {
              cenCopy[clave] = centros[clave]
          }
      })
      return cenCopy
    }

    useEffect(() => {
      const fetchData = async () => {
          try {
              const res = await axios.get(`http://localhost:8000/public/listarCentros?id=&nombre=&direccion=&hora_abre=&hora_cierra=`);
              setCentros(procesarcen(res.data));
          } catch (error) {
              console.error(error);
          }
      };
      fetchData();
  }, []);

    return (
        <div>
            <br /><br /><br /><br /><br /><br />
            <form onSubmit={handleSubmit}>
                <input type="text" value={nombre} onChange={handleNombreChange} placeholder={nombre} required />
                <br /><br />
                <textarea value={descripcion} onChange={handleDescripcionChange} maxLength="255" placeholder="Descripción del producto (Máximo 255 caracteres)" required></textarea>
                <br /><br />
                <label>
                    Seleccione las fotos que queres agregar:
                    //Hacer algo para que pueda agregar fotos.
                </label>
                <label>
                    Seleccione las fotos a eliminar:
                    //Aca hay que hacer algo para poder eliminar fotos
                </label>
                <br /><br />
                <select id="centro" onChange={handleCentrosChange} multiple>
                    <option value="">Seleccione un centro</option>
                    {centros.map((centro) => (
                        <option key={centro.id} value={centro.id}>
                            {centro.nombre}
                        </option>
                    ))}
                </select>
                <br /> <br/>
                <ButtonSubmit text="Editar producto!" />
            </form>
            {myError &&
                <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
            }
        </div>
    ); */
};

export default ModificarPublicacion;

